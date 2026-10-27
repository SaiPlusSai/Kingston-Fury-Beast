"""
test_rag_service.py
===================
Unit test suite verifying FAISS vector retrieval and citizen assistance responses.
"""

import os
import unittest
from src.rag.rag_service import UrbanRAGService


class TestUrbanRAGService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        kb_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base_lapaz.json")
        )
        cls.service = UrbanRAGService(kb_path=kb_path)

    def test_indexing_success(self):
        self.assertGreater(len(self.service.documents), 0)
        self.assertIsNotNone(self.service.index)
        self.assertGreater(self.service.index.ntotal, 0)

    def test_query_emergencies_phone(self):
        res = self.service.answer_query("número de bomberos o incendio")
        self.assertTrue(res["matched"])
        self.assertIn("119", res["answer"])
        self.assertGreater(len(res["sources"]), 0)

    def test_query_police_center(self):
        res = self.service.answer_query("módulos policiales en el centro de La Paz")
        self.assertTrue(res["matched"])
        self.assertIn("Centro", res["answer"])

    def test_query_unknown_fallback(self):
        res = self.service.answer_query("receta de comida para perros con chocolate")
        self.assertFalse(res["matched"])
        self.assertIn("110", res["answer"])


if __name__ == "__main__":
    unittest.main()
