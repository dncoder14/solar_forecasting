"""
data_preprocessing.py
---------------------
Handles all data loading, cleaning, scaling, and splitting for the
solar power forecasting pipeline.
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

TARGET_COLUMN = "generated_power_kw"


def load_and_preprocess(data_path: str, test_size: float = 0.2, random_state: int = 42):
    """
    Load the solar dataset, handle missing values, scale features, and
    split into train/test sets.

    Parameters
    ----------
    data_path : str
        Path to the CSV dataset file.
    test_size : float, optional
        Fraction of data reserved for testing (default 0.2).
    random_state : int, optional
        Random seed for reproducibility (default 42).

    Returns
    -------
    X_train : pd.DataFrame
        Scaled training features.
    X_test : pd.DataFrame
        Scaled test features.
    y_train : pd.Series
        Training target values.
    y_test : pd.Series
        Test target values.
    scaler : StandardScaler
        Fitted scaler — persist this alongside the model so inference
        inputs can be transformed consistently.
    feature_names : list[str]
        Ordered list of feature column names.
    """
    # ── 1. Load ───────────────────────────────────────────────────────────────
    df = pd.read_csv(data_path)

    # ── 2. Missing-value handling ─────────────────────────────────────────────
    if df.isnull().any().any():
        numeric_cols = df.select_dtypes(include="number").columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    # ── 3. Feature / target split ─────────────────────────────────────────────
    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]
    feature_names = list(X.columns)

    # ── 4. Train / test split ─────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    # ── 5. Feature scaling ────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train = pd.DataFrame(
        scaler.fit_transform(X_train), columns=feature_names, index=X_train.index
    )
    X_test = pd.DataFrame(
        scaler.transform(X_test), columns=feature_names, index=X_test.index
    )

    return X_train, X_test, y_train, y_test, scaler, feature_names
