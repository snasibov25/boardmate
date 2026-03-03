import os


script_dir = os.path.dirname(os.path.abspath(__file__))

os.system(f"python3 {script_dir}/ConnectToCamera.py")
os.system(f"python3 {script_dir}/capture_image.py")
os.system(f"python3 {script_dir}/PDF.py")
#os.system("python3 jpg_to_pdf.py ~/Desktop/captures")
