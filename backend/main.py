import asyncio
from flask import Flask, request
from flask_cors import CORS
from datetime import datetime, date
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

def count_occurrences_of_each_elemt_in(list_elem):  
        amount_dict = dict()
        for key in list_elem:
                if (key in amount_dict):
                    amount_dict[key] = (amount_dict[key]) + 1
                else:
                    amount_dict[key] = 1

        return [list(tuple_elem) for tuple_elem in amount_dict.items()]

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
    return [list(tuple_elem) for tuple_elem in wordsCount.most_common(100)]
    
@app.route("/getLocations", methods=["GET"])
def get_locations():
    return [[jsonObject["Longitude"], jsonObject["Latitude"], jsonObject["Kurstitel"], jsonObject["Kurslink"] ] for jsonObject in get_jsonlist_from_database()]


# TODO replace commas inside string with " " 
def create_file_from_list(list_elem, filename):
    first_comma_ignored = False
    with open("./database/created_files/" + filename, "w") as filestream:
        filestream.write('[')
        for elem in list_elem:
            if elem != "":
                first_comma_ignored_2 = False
                if (first_comma_ignored != True):
                        first_comma_ignored = True
                else:
                    filestream.write(',')
                if isinstance(elem,list):
                    filestream.write('[')
                    for elem_2 in elem:
                        if (first_comma_ignored_2 != True):
                            filestream.write(str(elem_2))
                            first_comma_ignored_2 = True
                        else: 
                            filestream.write(',' + str(elem_2))
                    filestream.write(']')
                else:
                        filestream.write(str(elem))
        filestream.write(']')

def get_word_count_list():
    filter_words = set(stopwords.words('german')) 
    filter_words.update({"ca", "tage", "tag", "erstellen", "gelernt", "vertiefung", "inhalte", "sowie", "lernen", "kurs", "gelernten", "m/w/d", "i", "ii", "iii" , "iv", "teil", "stufe"})
    filter_symbols = string.punctuation + "0123456789"
    word_occurrences = nltk.FreqDist('')
    for jsonObject in get_jsonlist_from_database():
        course_titel_words = nltk.word_tokenize(((jsonObject['Kurstitel']).lower()))        
        word_occurrences.update([word for word in course_titel_words if word not in filter_words and word not in filter_symbols])

    return [list(tuple_elem) for tuple_elem in word_occurrences.most_common(100)]

@app.route("/runDatabase", methods=["GET"])
def run_database():

    # creating data file for the map markers
    markerlocations = [[jsonObject["Longitude"], jsonObject["Latitude"], jsonObject["Kurstitel"], jsonObject["Kurslink"] ] for jsonObject in get_jsonlist_from_database()]
    create_file_from_list(markerlocations, "course_location.txt")
    del markerlocations

    # creating data file for the provider bar chart
    provider_occurrences_list = [jsonObject["Anbietername"] for jsonObject in get_jsonlist_from_database() if jsonObject["Anbietername"] != ""]
    provider_occurrences_list = count_occurrences_of_each_elemt_in(provider_occurrences_list)
    provider_occurrences_list.sort(key = lambda provider: provider[1], reverse = True)
    create_file_from_list(provider_occurrences_list, "course_providers.txt")
    del provider_occurrences_list

    # create data file for the wordcloud
    word_count_list = get_word_count_list()
    create_file_from_list(word_count_list, "word_occurrences.txt")
    del word_count_list

    # create data file for course start date (heatmap and linechart)
    start_dates_list = [jsonObject["Kursbeginn"] for jsonObject in get_jsonlist_from_database() if jsonObject["Kursbeginn"] != ""]
    start_dates_list = count_occurrences_of_each_elemt_in(start_dates_list)
    start_dates_list.sort(key = lambda date_occurrences:  datetime.strptime(date_occurrences[0], '%Y-%m-%d'))
    create_file_from_list(start_dates_list, "start_dates.txt")
    del start_dates_list

    return "All Files are created"
 


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)