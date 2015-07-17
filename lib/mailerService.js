'use strict';

var nodemailer = require('nodemailer'),
  mg = require('nodemailer-mailgun-transport'),
  emailTemplates = require('email-templates'),
  path = require('path'),
  templatesDir = path.resolve(__dirname, 'emailTemplates'),
  config = require(path.resolve('./config/config'));

var transport  = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "ordiargus@gmail.com",
        pass: "Katkout198322Karim"
    }
});

var options = {
  template: 'invite',
  from: config.app.title + ' <' + config.app.email + '>',
  subject: 'Merci pour votre inscreption ' + config.app.title 
};
    
exports.sendMail = function(data, callback) {
  emailTemplates(templatesDir, function(err, template) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      // Send a single email
      template(options.template, data, function(err, html, text) {
        if (err) {
          callback(err);
          console.log(err);
        } else {
          transport.sendMail({
            from: options.from,
            to: data.email,
            subject: options.subject,
            html: html,
            // generateTextFromHTML: true,
            text: text
          },function(err, responseStatus) {
            if (err) {
              callback(err, responseStatus);
            } else {
              callback(null, responseStatus);
            }
          });
        }
      });
    }
  });
};
