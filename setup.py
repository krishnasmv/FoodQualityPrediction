from setuptools import find_packages,setup
from typing import List

HYPHEN_E = '-e .'

def get_requirements(file_str:str) -> List[str]:
    '''Return list of requirements from file'''
    requirements = []
    with open(file_str,'r') as file:
        requirements = file.readlines()
        requirements = [req.replace('\n', "") for req in requirements]

        if HYPHEN_E in requirements:
            requirements.remove(HYPHEN_E)
    
    return requirements


setup(
    name='FoodQualityPrediction', 
    version='0.0.1', 
    author='Mohan',
    author_email='smvkrishna868@gmail.com', 
    packages=find_packages(),
    install_requires=get_requirements('requirements.txt')
)