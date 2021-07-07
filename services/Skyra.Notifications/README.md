## Youtube Notifications

### How does it work?

Youtube notifications work via a free service provided by Google, running on their own [pubsubhubbub](https://pubsubhubbub.appspot.com/) API.

Firstly, we use GRPC to send in requests from the running instance of Skyra, to the microservice, to allow the two to communicate.

The first thing required is to send a form-url-encoded POST request to https://pubsubhubbub.appspot.com/ with the content of:
- hub.callback: the url of our http server for authentication requests.
- hub.mode: do we want to 'subscribe' or 'unsubscribe'.
- hub.topic: the url of the channel we want to subscribe to, in the format of `https://www.youtube.com/xml/feeds/videos.xml?channel_id={channelId}`.

as seen [here](https://github.com/skyra-project/skyra/blob/master/services/Skyra.Notifications/PubSubClient.cs#L37).

Next, Google will send a GET request to the url provided earlier via the callback, as seen [here](https://github.com/skyra-project/skyra/blob/master/services/Skyra.Notifications/Controllers/PubSubResponseController.cs#L35), which you must respond with a 2XX status and write the content of the query string 'hub.challenge' they provide with their request, as this is how they authenticate you actually want to subscribe or unsubscribe. We have additional logic to check the request *truly* came from us, as we store the requests we send in step one, and check for them in the authentication callback. If you do not believe this request came from you however, you must return 404 NOT FOUND, and Google will disregard this. They will also send additional information (such as hub.lease_time, or how long until you need to resubscribe, hub.mode, for checking if you really send this request).

Now, whenever that channel uploads, Google will send us a notification via the same callback URL, instead via a POST request this time. We must return 200 OK.

We then communicate all this back via GRPC, via a streaming service, as soon as possible.

### Useful tools

- [BloomRPC](https://github.com/uw-labs/bloomrpc) for sending and receiving GRPC requests without having to write code or spin up an instance of Skyra.
- [PubSubHubBub Appspot](https://pubsubhubbub.appspot.com/) for viewing any subscriptions/unsubscriptions.
