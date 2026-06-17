import sys
import pickle

model = pickle.load(open("glowelle_skin_model.pkl", "rb"))
tfidf = pickle.load(open("tfidf_vectorizer.pkl", "rb"))

text = " ".join(sys.argv[1:])

text_vector = tfidf.transform([text])

prediction = model.predict(text_vector)

print(prediction[0])