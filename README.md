# Bachelorthesis Data Visualization Dashboard
This website was created by me as a part of my bachelor thesis. The goal was to visualize the data of a meta search engine of courses all over germany to get valueable information out of pure data.

Live demonstration here: https://dashboard.iplus.svc.educs-hosting.net/

I used the free AdmitKit template (https://adminkit.io/) as visual foundation. 
I used React to implement all the functionality to the website and implemented each graph as react component.
D3js was used for the graphs and Leaflet was used for the map.

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
