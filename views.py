import json
import sys
import re
import urllib.request
import urllib.error
from os import path
import random
from urllib.parse import quote
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
_weather_record_status={}
 
def record_weather_userid(userid):
    status_value = 'weather'
     
    if userid in _weather_record_status.keys():
        print("waiting_weather_status")
        return status_value
    else:
        print("new_weather_status")
        _weather_record_status[userid] = status_value
        return status_value
 
def weather_w_judgment(userid, text):
    if userid in _weather_record_status.keys():
        text = "weather " + text
        return text
    else:
        return text
 
def del_weather_userid(userid):
    if userid in _weather_record_status.keys():
        del _weather_record_status[userid]
     
def test_weather(reuest, location):
    _weather_pic = _weather(location)
    return HttpResponse(_weather_pic["_weather_pic"])
 
def _cal_news_article_nums():
    req = urllib.request.urlopen(
        "https://newsapi.org/v1/articles?source=techcrunch&apiKey=Ericbalabababa_key")
    req_decode = req.read().decode()
    req_object = json.loads(req_decode)
    all_articles = (req_object)['articles']
    articles_num = len(all_articles)
    if articles_num > 4 :
        articles_num = 4
        return articles_num
    else:
        articles_num = articles_num
        return articles_num
 
def _get_news():
    req = urllib.request.urlopen(
        "https://newsapi.org/v1/articles?source=techcrunch&apiKey=Ericbalabababa_key")
    req_decode = req.read().decode()
    req_object = json.loads(req_decode)
    news_object = req_object
    return news_object
 
def _news(news_object, i):
    _title ='{:.40}'.format(news_object['articles'][i]['title'])
    _description ='{:.59}'.format(news_object['articles'][i]['description']) 
    _urlToImage = news_object['articles'][i]['urlToImage'] 
    _url = news_object['articles'][i]['url']
    return {"_title":_title, "_description":_description, "_urlToImage": _urlToImage, "_url":_url}
 
def _weather(location):
    utf_location=quote(location) #request to weather need be UTF8 (E.g.enter chonese)
    req = urllib.request.urlopen(
        "http://api.openweathermap.org/data/2.5/weather?APPID=Ericbalabababa_ID"
         % utf_location)
    req_decode = req.read().decode('utf-8')
    req_object = json.loads(req_decode)
    _country='{:.2}'.format(req_object['sys']['country'])
    _weather_pic='{:.10}'.format(req_object['weather'][0]['main']) 
    _temperature='{:.1f}'.format(req_object['main']['temp'] - 273.15)
    return {"_country":_country, "_weather_pic":_weather_pic, "_temperature":_temperature}
 
def weather_picture(request, weather, size):
    BASE_DIR = path.dirname(path.dirname(path.abspath(__file__)))
    image_path='app/weather_image'
    full_path=path.join(BASE_DIR ,image_path, weather, size+".jpg")
    with open(full_path, "rb") as read_file:
        return HttpResponse(read_file.read(), content_type="image/jpeg")
 
def whattoeat_picture(request, choose, random_num, size):
    BASE_DIR = path.dirname(path.dirname(path.abspath(__file__)))
    image_path='app/whattoeat_image'
    full_path=path.join(BASE_DIR ,image_path,choose,random_num, size+".jpg")
    with open(full_path, "rb") as read_file:
        return HttpResponse(read_file.read(), content_type="image/jpeg")
 
def button_picture(request, button, size):
    BASE_DIR = path.dirname(path.dirname(path.abspath(__file__)))
    image_path='app/button_image'
    full_path=path.join(BASE_DIR ,image_path, button, size+".jpg")
    with open(full_path, "rb") as read_file:
        return HttpResponse(read_file.read(), content_type="image/jpeg")
 
@csrf_exempt
def elapp(request):
    input_type = _paser_input_type(request) # type message or postback
    print("-------------",input_type)
    if input_type == 'message':
        (token, text, userid)=_decode_json(request)
        text = weather_w_judgment(userid, text) #judge input weather button or not
        _pasered_input = _paser_input_text(text)
 
        if _pasered_input == "userid":
            payload = echo_payload(token, userid)
            result = _to_LINE_server(payload)
        elif _pasered_input == "Cheap_Food" or _pasered_input == "Delicious_Food":
            payload = food_payload(token, text)
            result = _to_LINE_server(payload)
        elif _pasered_input == text:
            payload = echo_payload(token, text)
            result = _to_LINE_server(payload)
        else:    
            payload = weather_payload(token, _pasered_input)
            result = _to_LINE_server(payload)    
            del_weather_userid(userid)  # del user id from dictionary
    else: #postback event
        (token, postback_data, userid) = _decode_postback_json(request)
        if postback_data == "get_weather":
            print("to get_weather")
            status_value = record_weather_userid(userid) #always return weather and add userid
            print(status_value)
            payload = _reply_weather_payload(token)
            result = _to_LINE_server(payload)
        elif postback_data == 'get_eat':
            payload = _reply_food_HL_payload(token)
            result = _to_LINE_server(payload)
        elif postback_data == 'get_news':
            payload = _reply_news_payload(token)
            print("---------news_payload",payload)
            result = _to_LINE_server(payload)
        else:
            print("not support")
 
    if request.method == 'GET':
        return HttpResponse("GET")
    elif request.method == 'POST': 
        return HttpResponse(json.dumps(result))
 
def _paser_input_type(request):
    body_unicode = request.body.decode('utf-8') #亂碼變正常
    body = json.loads(body_unicode) #JSON 文字轉物件
    input_type = body["events"][0]["type"]   # LINE message from client msg type
    return input_type
 
def _paser_input_text(_text):
    text_split = _text.split()
    first_split = text_split[0] #from user text
    if first_split == 'weather' or first_split == 'Weather' or first_split == 'WEATHER' or first_split == 'W' or first_split == 'w':
        location = text_split[1]
        return _weather(location)
    elif first_split == 'userid' or first_split == 'userId' or first_split == 'UserId':   
        return "userid"
    else:
        return _text    
 
def _decode_json(request):
    body_unicode = request.body.decode('utf-8') #亂碼變正常
    body = json.loads(body_unicode) #JSON 文字轉物件
    _token=body["events"][0]["replyToken"]   # LINE message from client
    _text=body["events"][0]["message"]["text"] # LINE message from client
    _userid=body["events"][0]["source"]["userId"]
    return (_token, _text, _userid)
 
def _decode_postback_json(request):
    body_unicode = request.body.decode('utf-8') #亂碼變正常
    body = json.loads(body_unicode) #JSON 文字轉物件
    _token=body["events"][0]["replyToken"]   # LINE token from client
    _postback_data=body["events"][0]["postback"]["data"] # LINE postback from client
    _userid=body["events"][0]["source"]["userId"]
    return (_token, _postback_data, _userid)
 
def echo_payload(_token, _text):
    payload = {
    "replyToken": _token,
    "messages":[
        {
            "type": "template",
            "altText": "this is a button template",
            "template": {
                "type": "buttons",
                "thumbnailImageUrl": "https://Ericbalabababa_URL/button_picture/pumpkin/240.jpg",
                "title": "I want to search",
                "text": "Echo: %s" % _text,
                "actions": [
                    {
                        "type": "postback",
                        "label": "Weather",
                        "data": "get_weather"
                    },
                    {
                        "type": "postback",
                        "label": "Eat",
                        "data": "get_eat"
                    },
                    {
                        "type": "postback",
                        "label": "News",
                        "data": "get_news"
                    }
                ]
            }
        }        
    ] 
    }
    return payload    
def weather_payload(_token, _text):
    all_weather = ["Wind", "Clouds", "Snow", "Rain", "Sun", "Clear"]
    weather_string="It's " + _text["_temperature"] + "C and " + _text["_weather_pic"] +" in "+ _text["_country"]
    print(weather_string)
    weather = _text["_weather_pic"]
    if weather in all_weather:
        weather = weather
    else:
        weather = '404'
               
    payload = {
    "replyToken": _token,
    "messages":[
        {
            "type":"text",
            "text":weather_string
        },
        {
            "type": "image",
            "originalContentUrl": 
            "https://Ericbalabababa_URL/weather_picture/%s/1024.jpg" %weather,
            "previewImageUrl":
            "https://Ericbalabababa_URL/weather_picture/%s/240.jpg" %weather
        } 
    ] 
    }
    return payload
 
def _reply_weather_payload(_token):
    payload = {
    "replyToken": _token,
    "messages":[
        {
            "type":"text",
            "text":"Enter a city name."
        }
    ] 
    }   
    print("_reply_weather_payload")
    return payload
 
def _reply_food_HL_payload(_token):
    payload = {
    "replyToken": _token,
    "messages":[    
        {
          "type": "template",
          "altText": "this is a confirm template",
          "template": {
              "type": "confirm",
              "text": "Choose food",
              "actions": [
                  {
                    "type": "message",
                    "label": "Cheap",
                    "text": "Cheap_Food"
                  },
                  {
                    "type": "message",
                    "label": "Delicious",
                    "text": "Delicious_Food"
                  }
              ]
          }
        }
    ]
    }
    return payload
 
def food_payload(token, text):
    random_num = random.randint(1,6)
    print("FOOD_RANDOM_NUM--------------",random_num)
    choose = text
    payload = {
    "replyToken": token,
    "messages":[
        {
            "type": "image",
            "originalContentUrl": 
            "https://el-server.azurewebsites.net/whattoeat_picture/{0}/{1}/1024.jpg".format(choose,random_num),
            "previewImageUrl":
            #"https://el-server.azurewebsites.net/whattoeat_picture/Delicious_Food/1/240.jpg"
            "https://el-server.azurewebsites.net/whattoeat_picture/{0}/{1}/240.jpg".format(choose,random_num)
        } 
    ] 
    }
    return payload
 
def _reply_news_payload(token):
    articles_num = _cal_news_article_nums()
    news_object = _get_news() #只取一次比較快
    _columns = []
    for i in range(articles_num):
        news = _news(news_object, i) # 0, 1, 2, 3, 4
        title = news["_title"]
        description = news["_description"]
        urltoimage = news["_urlToImage"]
        url = news["_url"]
        _columns[len(_columns):] = [
        {
            "thumbnailImageUrl": urltoimage,
            "title": title,
            "text": description,
            "actions": [  
                {
                    "type": "uri",
                    "label": "View detail",
                    "uri": url
                }
            ]
        } 
        ]
     
    payload = {
    "replyToken": token,
    "messages":[
    {
        "type": "template",
        "altText": "this is a carousel template",
        "template": {
            "type": "carousel",
            "columns": _columns
        }
    }
    ]
    }
    return payload    
 
def _to_LINE_server(payload):
    payload = payload
    req=urllib.request.Request("https://api.line.me/v2/bot/message/reply",
        data=json.dumps(payload).encode('utf8'),
        headers={
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": "Bearer Ericbalabababa_ID",
        })
     
    try:
        with urllib.request.urlopen(req) as response:
            print(response.read())
    except urllib.error.HTTPError as err: 
        print(err)
