# Bachelorarbeit_Dashboard
Bachelorarbeit-Dashboard

# Install

## Back-end server
- install python
- install pipenv
    - run "pip install pipenv --user"
    - add pipenv into PATH
 	Run the following command: $ py -m site --user-site
	A sample output can be:	C:\Users\jetbrains\AppData\Roaming\Python\Python37\site-packages

	Replace site-packages with Scripts in this path to receive a string for adding to the PATH variable, for example:
	$ setx PATH "%PATH%;C:\Users\jetbrains\AppData\Roaming\Python\Python37\Scripts"

- in terminal go to /backend folder of the project
- run "pipenv install"
- run "pipenv shell"
- start server by "python main.py"

## Front-end 
- install yarn on your computer
- in terminal go to subfolder "/frontend" of the project
- run "yarn install"
- start front-ent with "yarn start"


The front-end App is running on localhost:3000 and the backend server is running at localhost:5050
