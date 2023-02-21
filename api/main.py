import asyncio
from flask import Flask, request
from flask_cors import CORS
import json_stream
import string 
import json
import re
import nltk
from nltk.corpus import stopwords
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)


user_to_repos = {}

@app.route("/coursesStartDate", methods=["GET"])
def getCoursesStartDate():
    # 2022-09-26
    return [jsonObject["Kursbeginn"] for jsonObject in getJsonList()]

@app.route("/coursesCourseOwner", methods=["GET"])
def getCoursesCourseOwner():
    return [jsonObject["Anbietername"] for jsonObject in getJsonList()]


@app.route("/coursesCount", methods=["GET"])
def getCoursesCount():
    return str(len(getJsonList()))

def getJsonList():
    with open("./database/Top20k.json", "r", encoding="utf-8") as stream: 
        splitCharacter = '}'
        return [json.loads(str(x + splitCharacter)) for x in stream.read().split(splitCharacter) if x != '\n' and x != '' and x != ' ' ]
    

@app.route("/wordsCount", methods=["GET"])
def getWordCountOfTitelAndDescription():
    allWordsList = []
    stopWords = set(stopwords.words('german')) 
    stopWords.update({"ca","tage","tag","erstellen","gelernt","vertiefung","inhalte","sowie","lernen","kurs","gelernten"})
    wordsCount = nltk.FreqDist('')
    for jsonObject in getJsonList():
        courseTitelWords = nltk.word_tokenize(((jsonObject['Kurstitel']).lower()))        
        wordsCount.update([word for word in courseTitelWords if word not in stopWords and word not in string.punctuation+"0123456789"])

    return wordsCount.most_common(100)
    
@app.route("/getLocations", methods=["GET"])
def getLocations():
    markerlocations = [[jsonObject["Longitude"], jsonObject["Latitude"], jsonObject["Kurstitel"], jsonObject["Kurslink"] ] for jsonObject in getJsonList()]
    return markerlocations

def splitAllWordsOf(jsonItem):
    if jsonItem != "":
       jsonObject = json.loads(jsonItem)
    return jsonObject['Kurstitel'] + jsonObject['Kursbeschreibung']
        
        
    
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)