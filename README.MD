# [<img title="skipper-ftp - FTP filesystem adapter for Skipper" src="http://i.imgur.com/P6gptnI.png" width="200px" alt="skipper emblem - face of a ship's captain"/>](https://github.com/willhuang85/skipper-gridfs) Skipper FTP Adapter
[![npm](https://img.shields.io/npm/v/skipper-ftp.svg)](https://www.npmjs.com/package/skipper-ftp)
[![npm](https://img.shields.io/npm/l/express.svg)]()

This is used to upload files directly to FTP server using [skipper](https://github.com/balderdashy/skipper) and [node-ftp](https://github.com/mscdex/node-ftp)



## Installation

```
$ npm install skipper-ftp --save
```

Also make sure you have skipper [installed as your body parser](http://beta.sailsjs.org/#/documentation/concepts/Middleware?q=adding-or-overriding-http-middleware).

> Skipper is installed by default in [Sails](https://github.com/balderdashy/sails) v0.10.


## Usage

```javascript
req.file('file')
.upload({
  adapter: require('skipper-ftp'),
  host: 'ftp.localhost',
  port: 21,
  username:'root',
  password:'root',
  path:'/'
}, function whenDone(err, uploadedFiles) {
  if (err) return res.negotiate(err);
  else return res.ok({
    files: uploadedFiles
  });
});
```

| Option        | Type       | Details |
|-----------    |:----------:|---------|
| `host`         | ((string)) | An optional parameter of the host or domain/IP. Default value: `localhost`|
| `port` | ((number)) | An optional parameter for port. Default value :`21`|
| `path` | ((string)) | An optional parameter if you wish to save the file in a particular path in your file server. Default value :`/`|
| `user` | ((string)) | An optional parameter for authentication. Default value :`root`|
| `password` | ((string)) | An optional parameter for authentication. Default value :`root`|

check  [node-ftp](https://github.com/mscdex/node-ftp#methods) options for more

## UploadedFiles
The meta data is returned along with **`extra`** which may contain `error` field. The `error` is going to return ana error encountered while uploading the file to your FTP server

## Testing

* Clone this repository

* Install all development dependencies

```sh
$ npm install
```
* Then run test

```sh
$ npm test
```

## Contribute

Fork this repo and push in your ideas.
Do not forget to follow [skipper-adapter-test](https://github.com/balderdashy/skipper-adapter-tests) standards



## License

MIT License (MIT)
