import os

models_dir = '..'
filename = 'model_aki.keras'
model_path = os.path.join(models_dir, filename)

print(f"Models dir: {models_dir}")
print(f"Filename: {filename}")
print(f"Full path: {model_path}")
print(f"Absolute path: {os.path.abspath(model_path)}")
print(f"Exists: {os.path.exists(model_path)}")

# Also check scaler
scaler_path = os.path.join(models_dir, 'scaler.pkl')
print(f"\nScaler path: {scaler_path}")
print(f"Scaler absolute: {os.path.abspath(scaler_path)}")
print(f"Scaler exists: {os.path.exists(scaler_path)}")

# List what's actually in the parent directory
parent_dir = os.path.abspath('..')
print(f"\nContents of {parent_dir}:")
for item in os.listdir(parent_dir):
    if item.endswith('.keras') or item.endswith('.pkl'):
        print(f"  {item}")
