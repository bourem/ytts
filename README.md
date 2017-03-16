# ytts #
YouTubeTimeStamper (subtitles tool)

Toy project, for learning purpose.

### Description ###
Django application to write subtitles for Youtube videos through the Youtube Player API.

### Content ###
* A Django app (not a whole Django site) - https://www.djangoproject.com/
* with frontend using the Vue.js framework - https://vuejs.org/
* and using the Webpack module bundler (+npm) - https://webpack.js.org/

### How to set up backend (Python + Django) ###
https://docs.djangoproject.com/en/1.10/intro/install/

In the site's directory, after running the db migration, start the local dev server:
```
python manage.py runserver
```
### How to build the frontend JS bundles ###
https://webpack.js.org/guides/installation/

In the app's directory:
```
npm install
npm run dev
```

### Other ###
Heroku instance (very far behind HEAD): https://ytts.herokuapp.com/ytts/jNQXAC9IVRw/edit/

Trello: https://trello.com/b/f9qfmtTk/ytts
