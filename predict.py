import sys
import pickle
import pandas as pd

model = pickle.load(open("glowelle_skin_model.pkl", "rb"))

oiliness = int(sys.argv[1])
dryness = int(sys.argv[2])
sensitivity = int(sys.argv[3])

data = pd.DataFrame([{
    "oiliness": oiliness,
    "dryness": dryness,
    "sensitivity": sensitivity
}])

prediction = model.predict(data)

print(prediction[0])