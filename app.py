import streamlit as st
import pandas as pd
import joblib

st.title("Solar Energy Generation Forecasting")

df = pd.read_csv("data/spg.csv")
X = df.drop("generated_power_kw", axis=1)

model = joblib.load("models/solar_model.pkl")

st.subheader("Enter Weather Parameters")

inputs = []

for col in X.columns:
    value = st.number_input(col, value=0.0)
    inputs.append(value)

if st.button("Predict"):
    prediction = model.predict([inputs])
    st.success(f"Predicted Solar Power (kW): {prediction[0]:.4f}")