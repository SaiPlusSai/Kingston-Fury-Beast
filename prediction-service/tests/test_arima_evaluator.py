"""
test_arima_evaluator.py
=======================
Unit test suite verifying ARIMA training and the ModelEvaluator module.
Fulfills QA requirements for BUILD-08 and BUILD-09.
"""

import os
import unittest
import numpy as np
import pandas as pd

from src.models.arima_model import train_arima, validate_arima_input
from src.models.evaluator import (
    ModelEvaluator,
    calculate_metrics,
    compute_baseline_predictions,
    format_evaluation_table,
)


class TestArimaModel(unittest.TestCase):
    def setUp(self):
        self.dates = ["2026-01-{:02d}".format(i) for i in range(1, 31)]
        self.y = [10.0, 12.0, 9.0, 14.0, 11.0] * 6
        self.df = pd.DataFrame({"ds": self.dates, "y": self.y})

    def test_validate_arima_input_valid(self):
        self.assertTrue(validate_arima_input(self.df, "TestZone", min_samples=10))

    def test_validate_arima_input_insufficient_samples(self):
        short_df = self.df.head(5)
        self.assertFalse(validate_arima_input(short_df, "TestZone", min_samples=10))

    def test_train_arima_success(self):
        res = train_arima(self.df, "TestZone", periods=7, output_plots_dir=None)
        self.assertIsNotNone(res)
        self.assertIn("forecast", res)
        self.assertEqual(len(res["forecast"]), 7)
        self.assertIn("aic", res)
        self.assertTrue(all(res["forecast"]["yhat"] >= 0))


class TestModelEvaluator(unittest.TestCase):
    def test_calculate_metrics(self):
        y_true = np.array([10.0, 20.0, 30.0])
        y_pred = np.array([12.0, 18.0, 31.0])
        metrics = calculate_metrics(y_true, y_pred)
        self.assertIn("MAE", metrics)
        self.assertIn("RMSE", metrics)
        self.assertIn("MAPE", metrics)
        self.assertIn("R2", metrics)
        self.assertGreater(metrics["R2"], 0.8)

    def test_compute_baseline_predictions(self):
        import datetime
        train_dates = [datetime.date(2026, 1, i) for i in range(1, 15)]
        test_dates = [datetime.date(2026, 1, i) for i in range(15, 20)]
        train_y = np.array([5.0] * 14)
        preds = compute_baseline_predictions(train_y, train_dates, test_dates)
        self.assertEqual(len(preds["Baseline_Naive"]), 5)
        self.assertEqual(len(preds["Baseline_MA7"]), 5)
        self.assertEqual(len(preds["Baseline_Seasonal"]), 5)

    def test_evaluator_multizone_table(self):
        df = pd.DataFrame({
            "ds": ["2026-01-{:02d}".format(i) for i in range(1, 31)],
            "y": [10.0, 12.0, 8.0, 15.0, 9.0] * 6,
        })
        evaluator = ModelEvaluator(test_size=7)
        summary = evaluator.evaluate_multiple_zones({"Centro": df}, export_json=False)
        self.assertIn("Centro", summary["zones"])
        table_md = format_evaluation_table(summary)
        self.assertIn("ARIMA", table_md)
        self.assertIn("MAE", table_md)


if __name__ == "__main__":
    unittest.main()
