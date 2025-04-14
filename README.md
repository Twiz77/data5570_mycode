# Getting started

clone the repo
`git clone git@github.com:Manodiestra/data5570-spring-2025.git`

## Back End
1. Make a virtual environment
1. `python3 -m venv myvenv`
1. Activate it
1. `source myvenv/bin/activate`
1. Install pip modules
1. `pip3 install django djangorestframework django-cors-headers`
1. `cd django_back_end`
1. Make database migrations
1. `python3 manage.py makemigrations pickle_app`
1. `python3 manage.py migrate`
1. Run the app
1. `python3 manage.py runserver`
1. `python3 manage.py runserver 0.0.0.0:8000` (for receiving external traffic)

## Front End

1. Navigate into the expo directory
1. 'cd expo-app`
1. Install node_modules
1. `npm install`
1. Run the app
1. `npm start`
# paddleup
