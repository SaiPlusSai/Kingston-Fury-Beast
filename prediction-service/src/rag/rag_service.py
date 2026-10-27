"""
rag_service.py
==============
Retrieval-Augmented Generation (RAG) Service for Urban Emergencies and Citizen Assistance.
Fulfills course syllabus requirements on RAG, Vector Search (FAISS) and Semantic Context Retrieval.

Architecture:
1. Document store with urban safety knowledge base of La Paz.
2. Vector embeddings generation with TF-IDF / Cosine Vector Space indexed in FAISS.
3. Top-k similarity retrieval with relevance score thresholding.
4. Response synthesis with citation of normative sources.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import faiss

logger = logging.getLogger("halo.rag.service")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [rag_service.py]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

KB_DEFAULT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "knowledge_base_lapaz.json")
)


class UrbanRAGService:
    """Vector search and retrieval service using FAISS IndexFlatIP."""

    def __init__(self, kb_path: str = KB_DEFAULT_PATH):
        self.kb_path = kb_path
        self.documents: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.index: Optional[faiss.IndexFlatIP] = None
        self.load_knowledge_base()

    def load_knowledge_base(self) -> None:
        """Load and index documents into FAISS vector store."""
        if not os.path.exists(self.kb_path):
            logger.warning("Knowledge base file not found at %s", self.kb_path)
            return

        with open(self.kb_path, "r", encoding="utf-8") as f:
            self.documents = json.load(f)

        corpus = [f"{doc['title']} {doc['content']} {doc.get('macrodistrito', '')}" for doc in self.documents]
        spanish_stop_words = [
            "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
            "con", "no", "una", "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o",
            "este", "sí", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "también",
            "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos",
            "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto",
            "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto",
            "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar",
            "estas", "algunas", "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus",
            "ellas", "nosotras", "vosostros", "vosostras", "os", "mío", "mía", "míos", "mías",
            "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra",
            "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas",
            "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés", "estemos",
            "estéis", "estén", "estaré", "estarás", "estará", "estaremos", "estaréis", "estarán"
        ]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1024,
            stop_words=spanish_stop_words,
        )
        tfidf_matrix = self.vectorizer.fit_transform(corpus).toarray().astype("float32")

        # Normalize vectors for cosine similarity via inner product
        faiss.normalize_L2(tfidf_matrix)

        dim = tfidf_matrix.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(tfidf_matrix)
        logger.info("Indexed %d documents into FAISS vector store (dimension=%d)", len(self.documents), dim)

    def retrieve(self, query: str, top_k: int = 2, min_score: float = 0.08) -> List[Dict[str, Any]]:
        """
        Retrieve relevant knowledge chunks matching user query.
        """
        if not self.index or not self.vectorizer or not self.documents:
            return []

        query_vec = self.vectorizer.transform([query]).toarray().astype("float32")
        faiss.normalize_L2(query_vec)

        scores, indices = self.index.search(query_vec, top_k)
        results = []

        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and score >= min_score:
                doc = self.documents[idx].copy()
                doc["similarity_score"] = round(float(score), 4)
                results.append(doc)

        return results

    def answer_query(self, query: str) -> Dict[str, Any]:
        """
        Synthesize citizen answer with grounded sources.
        """
        chunks = self.retrieve(query)
        if not chunks:
            return {
                "matched": False,
                "answer": "No encontré una respuesta específica en la base de normativas ciudadanas. Para auxilio inmediato llame al 110 (Policía) o 165 (Alcaldía de La Paz).",
                "sources": [],
            }

        primary_doc = chunks[0]
        sources = [f"{c['title']} (Score: {c['similarity_score']})" for c in chunks]

        return {
            "matched": True,
            "answer": primary_doc["content"],
            "title": primary_doc["title"],
            "category": primary_doc.get("category", "general"),
            "similarity_score": primary_doc["similarity_score"],
            "sources": sources,
        }


# Global singleton instance for high performance
_rag_instance = None


def get_rag_service() -> UrbanRAGService:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = UrbanRAGService()
    return _rag_instance


def query_rag(text: str) -> Dict[str, Any]:
    """Public helper function to query RAG."""
    return get_rag_service().answer_query(text)


if __name__ == "__main__":
    service = UrbanRAGService()
    queries = [
        "A qué número llamo si hay un incendio?",
        "Donde hay módulos policiales en el Centro?",
        "Qué hago si hay grietas o deslizamientos por lluvias?",
    ]
    for q in queries:
        print(f"\nConsulta: '{q}'")
        res = service.answer_query(q)
        print(f"Respuesta: {res['answer']}")
        print(f"Fuentes: {res.get('sources')}")
