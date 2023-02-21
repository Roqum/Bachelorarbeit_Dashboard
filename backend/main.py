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


DATABSE_FILENAME = "Top20k.json"
user_to_repos = {}

def get_jsonlist_from_database():
    with open("./database/" + DATABSE_FILENAME, "r", encoding="utf-8") as stream: 
        splitCharacter = '}'
        return [json.loads(str(x + splitCharacter)) for x in stream.read().split(splitCharacter) if x != '\n' and x != '' and x != ' ' ]

def split_all_words_of(jsonItem):
    if jsonItem != "":
       jsonObject = json.loads(jsonItem)
    return jsonObject['Kurstitel'] + jsonObject['Kursbeschreibung']

def create_course_provider_jsonfile():
    course_provider_list = [jsonObject["Anbietername"] for jsonObject in get_jsonlist_from_database()]
    provider_occurrences_amount = count_occurrences_of_each_elemt_in(course_provider_list)
    first_comma_ignored = False
    with open("./database/course_providers.txt", "w") as filestream:
        filestream.write('[')
        for provider in provider_occurrences_amount:
            if (first_comma_ignored != True):
                filestream.write('[' + provider[0] + ',' + str(provider[1]) + ']')
                first_comma_ignored = True
            else: 
                filestream.write(',[' + provider[0] + ',' + str(provider[1]) + ']')
        filestream.write(']')
        
#### Routings ####
@app.route("/coursesStartDate", methods=["GET"])
def get_courses_start_date():
    # 2022-09-26
    return [jsonObject["Kursbeginn"] for jsonObject in get_jsonlist_from_database()]

@app.route("/coursesProvider", methods=["GET"])
def get_courses_provider():
    return [jsonObject["Anbietername"] for jsonObject in get_jsonlist_from_database()]


@app.route("/coursesCount", methods=["GET"])
def get_courses_count():
    return str(len(get_jsonlist_from_database()))
    
@app.route("/wordsCount", methods=["GET"])
def get_word_count_of_titel_and_description():
    allWordsList = []
    stopWords = set(stopwords.words('german')) 
    stopWords.update({"ca","tage","tag","erstellen","gelernt","vertiefung","inhalte","sowie","lernen","kurs","gelernten"})
    wordsCount = nltk.FreqDist('')
    for jsonObject in get_jsonlist_from_database():
        courseTitelWords = nltk.word_tokenize(((jsonObject['Kurstitel']).lower()))        
        wordsCount.update([word for word in courseTitelWords if word not in stopWords and word not in string.punctuation+"0123456789"])

    return wordsCount.most_common(100)
    
@app.route("/getLocations", methods=["GET"])
def get_locations():
    markerlocations = [[jsonObject["Longitude"], jsonObject["Latitude"], jsonObject["Kurstitel"], jsonObject["Kurslink"] ] for jsonObject in get_jsonlist_from_database()]
    return markerlocations

@app.route("/runDatabase", methods=["GET"])
def run_database():
    #create_words_count_jsonfile()
    #create_courses_start_date_jsonfile() (sorted)
    create_course_provider_jsonfile()
    #create_marker_locations_jsonfile()
    return "done"
 
def count_occurrences_of_each_elemt_in(list):  
        amount_dict = dict()
        for key in list:
            if (key in amount_dict):
                amount_dict[key] = (amount_dict[key]) + 1
            else:
                amount_dict[key] = 0

        return amount_dict.items()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)