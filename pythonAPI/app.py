from flask import Flask
from flask_restful import Api
from resources import ReadTableResource
from resources import ReadResource
from resources import EventResource

app = Flask(__name__)
api = Api(app)


api.add_resource(ReadTableResource, '/tabledata', endpoint='tabledata')
api.add_resource(ReadResource, '/readdata/<string:qname>', endpoint='readdata')
api.add_resource(EventResource, '/eventdata/<string:qname>', endpoint='eventdata')

if __name__ == '__main__':
    app.run(debug=True)