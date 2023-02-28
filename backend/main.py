import asyncio
from flask import Flask, request
from flask_cors import CORS
from datetime import datetime, date
import json_stream
import functools
import operator
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

#### Keywords to filter courses for subject #####
with open("category_keywords.json", "r") as file:
    CATEGORY_KEYWORDS = json.load(file)
##################################################

def create_courses_categorys_files():
    with open("./database/created_files/courses_category.json", "w") as filestream: 
        first_comma_ignored = False   
        filestream.write("{")
        for keyword_key, keyword_list  in CATEGORY_KEYWORDS.items():
            filestream.write(",") if first_comma_ignored else {}
            first_comma_ignored = True
            filestream.write('"' + keyword_key + '": ')
            if (keyword_key == "UNKNOWN_KEYWORDS"):
                filestream.write( json.dumps([[jsonobject['Longitude'], jsonobject['Latitude'], jsonobject['Kurstitel'], jsonobject['Kurslink']] for jsonobject in get_jsonlist_from_database() if all(word not in jsonobject["Kurstitel"].lower() + jsonobject["Schlagwort"].lower() for word in functools.reduce(operator.iconcat, CATEGORY_KEYWORDS.values(), []))]))          
            else:
                filestream.write( json.dumps([[jsonobject['Longitude'], jsonobject['Latitude'], jsonobject['Kurstitel'], jsonobject['Kurslink']] for jsonobject in get_jsonlist_from_database() if any(word in jsonobject["Kurstitel"].lower() + jsonobject["Schlagwort"].lower() for word in keyword_list)]))          
        filestream.write("}")

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

################## Routings #####################
@app.route("/coursesStartDateNoYear", methods=["GET"])
def get_courses_start_date():
    try:
        with open("./database/created_files/start_dates_without_years.txt", "r") as filestream:
            return filestream.read()
    except FileNotFoundError:
        return "No Data file found"

@app.route("/generalData", methods=["GET"])
def get_general_data():
    try:
        with open("./database/created_files/general_infos.txt", "r") as filestream:
            return filestream.read()
    except FileNotFoundError:
        return "No Data file found"

@app.route("/coursesProvider", methods=["GET"])
def get_courses_provider():
    try:
        with open("./database/created_files/course_providers.txt", "r") as filestream:
                return filestream.read()
    except FileNotFoundError:
        return "No Data file found"

@app.route("/coursesCount", methods=["GET"])
def get_courses_count():
    return str(len(get_jsonlist_from_database()))
    
@app.route("/wordsCount", methods=["GET"])
def get_word_count_of_titel_and_description():
    try:
        with open("./database/created_files/word_occurrences.txt", "r") as filestream:
                return filestream.read()
    except FileNotFoundError:
        return "No Data file found"
    
@app.route("/getLocations", methods=["GET"])
def get_locations():
    try:
        with open("./database/created_files/courses_category.json", "r") as filestream:
                return filestream.read()
    except FileNotFoundError:
        return "No Data file found"

#################################################

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
                            filestream.write('"' + str(elem_2).replace('\n', '') + '"')
                            first_comma_ignored_2 = True
                        else: 
                            filestream.write(',"' + str(elem_2).replace('\n', '') + '"')
                    filestream.write(']')
                else:
                        filestream.write('"' + str(elem).replace('\n', '') + '"')
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

    # creating data file for courses in different categorys
    create_courses_categorys_files()

    # creating data file for the map markers
    """ markerlocations = [[jsonObject["Longitude"], jsonObject["Latitude"], jsonObject["Kurstitel"], jsonObject["Kurslink"] ] for jsonObject in get_jsonlist_from_database()]
    create_file_from_list(markerlocations, "course_location.txt")
    del markerlocations """

    # creating data file for the provider bar chart
    provider_occurrences_list = [jsonObject["Anbietername"] for jsonObject in get_jsonlist_from_database() if jsonObject["Anbietername"] != ""]
    provider_occurrences_list = count_occurrences_of_each_elemt_in(provider_occurrences_list)
    provider_occurrences_list.sort(key = lambda provider: provider[1], reverse = True)
    amount_of_provider = len(provider_occurrences_list)
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

    # create data file for course start date (heatmap and linechart)
    start_dates_list = [jsonObject["Kursbeginn"][5:] for jsonObject in get_jsonlist_from_database() if jsonObject["Kursbeginn"] != ""]
    start_dates_list = count_occurrences_of_each_elemt_in(start_dates_list)
    create_file_from_list(start_dates_list, "start_dates_without_years.txt")
    del start_dates_list

    # create file for online courses
    online_courses = [[jsonObject["Kurstitel"], jsonObject["Kurslink"]] for jsonObject in get_jsonlist_from_database() if (any(word in jsonObject["Kurstitel"].lower() + jsonObject["Schlagwort"].lower() for word in ["webseminar", "onlinekurs"])) or (jsonObject["Longitude"] == "0.000000" and jsonObject["Latitude"] == "0.000000")]
    amount_of_online_courses = len(online_courses)
    create_file_from_list(online_courses, "online_courses.txt")
    del online_courses

    # create data file for amount of courses in city
    amount_of_courses_in_city = [jsonObject["Kursstadt"] for jsonObject in get_jsonlist_from_database() if jsonObject["Kursstadt"] != ""]
    amount_of_courses_in_city = count_occurrences_of_each_elemt_in(amount_of_courses_in_city)
    amount_of_cities = len(amount_of_courses_in_city)
    create_file_from_list(amount_of_courses_in_city, "amount_of_courses_in_city.txt")
    del amount_of_courses_in_city

    # create general data file
    amount_of_courses = len(get_jsonlist_from_database())
    general_infos = [amount_of_courses, amount_of_cities, amount_of_online_courses, amount_of_provider]   
    create_file_from_list(general_infos, "general_infos.txt")
    del general_infos, amount_of_courses, amount_of_cities, amount_of_online_courses, amount_of_provider



    return "All Files are created"
 


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)