import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.cluster import KMeans
import joblib

data = {
    "age": [18,22,25,30,35,40,19,27,33,45,21,29,38,50,24,31,42,36,28,23],
    "oiliness": [8,7,6,3,2,1,9,6,4,1,8,5,2,1,7,4,2,3,6,8],
    "dryness": [2,3,4,7,8,9,1,4,6,9,2,5,8,9,3,6,8,7,4,2],
    "sensitivity": [3,4,5,6,7,8,2,5,6,9,3,5,7,9,4,6,8,7,5,3],
    "skin_type": [
        "oily","oily","combination","dry","dry","dry","oily","combination",
        "normal","dry","oily","normal","dry","dry","oily","normal",
        "dry","normal","combination","oily"
    ]
}

df = pd.DataFrame(data)

X = df[["age", "oiliness", "dryness", "sensitivity"]]
y = df["skin_type"]

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.3, random_state=42
)

models = {
    "KNN": KNeighborsClassifier(n_neighbors=3),
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Neural Network": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=1000, random_state=42)
}

results = []

for name, model in models.items():
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    results.append({
        "Model": name,
        "Accuracy": accuracy_score(y_test, predictions),
        "Precision": precision_score(y_test, predictions, average="weighted", zero_division=0),
        "Recall": recall_score(y_test, predictions, average="weighted", zero_division=0),
        "F1 Score": f1_score(y_test, predictions, average="weighted", zero_division=0)
    })

    print("\n==============================")
    print(name)
    print("==============================")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))
    print("Classification Report:")
    print(classification_report(y_test, predictions, zero_division=0))

results_df = pd.DataFrame(results)
print("\nMODEL COMPARISON TABLE")
print(results_df)

# Neural Network architecture 2
nn2 = MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=1000, random_state=42)
nn2.fit(X_train, y_train)
nn2_predictions = nn2.predict(X_test)

print("\nNEURAL NETWORK ARCHITECTURE 2")
print("Accuracy:", accuracy_score(y_test, nn2_predictions))
print("F1:", f1_score(y_test, nn2_predictions, average="weighted", zero_division=0))

# Clustering
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X)

df["cluster"] = clusters
print("\nCLUSTERING RESULTS")
print(df[["age", "oiliness", "dryness", "sensitivity", "skin_type", "cluster"]])

joblib.dump(models["Random Forest"], "glowelle_skin_model.pkl")
print("\nSaved model: glowelle_skin_model.pkl")