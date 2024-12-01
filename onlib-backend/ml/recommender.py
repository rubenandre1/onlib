import sys
import json
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

def generate_recommendations(user_id, interactions, books):
    # Criar DataFrames a partir das entradas
    interactions_df = pd.DataFrame(interactions)
    books_df = pd.DataFrame(books)

    # Merge para ter dados completos
    combined = pd.merge(interactions_df, books_df, on='book_id', how='inner')

    if combined.empty:
        return []

    # Calcular média de ratings por livro
    book_ratings = combined.groupby('book_id')['rating'].mean().reset_index()
    book_ratings = book_ratings.sort_values(by='rating', ascending=False)

    # Selecionar livros recomendados com base em média de ratings, excluindo livros já lidos
    read_books = combined[combined['user_id'] == user_id]['book_id'].tolist()
    recommendations = book_ratings[~book_ratings['book_id'].isin(read_books)]

    return recommendations.head(5)['book_id'].tolist()

if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())

    try:
        user_id = int(input_data['userId'])
        interactions = input_data['interactions']
        books = input_data['books']

        # Gerar recomendações
        recommended_books = generate_recommendations(user_id, interactions, books)

        # Retornar recomendações em JSON
        print(json.dumps(recommended_books))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
