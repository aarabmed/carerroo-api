const nodeMailer = require("nodemailer");

exports.newEmail = async (req, res, next) => {
  const sender = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;
  const name = req.body.name;
  const captcha = req.body.captcha;

  
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "careerooapp@gmail.com",
      pass: "tgktxdnscswzbojk",
    },
  });

  let mailOptions = {
    from: `careerooapp@gmail.com`, // contact@azcourses.io
    to: "careerooapp@gmail.com", // list of receivers
    subject: `${subject}`, // Subject line
    text: message, // plain text body
    //html: `<p><strong>Name :  </strong></p></br><p><strong>From :  </strong>${sender}</p></br></br><h5><strong>Message : </strong></h5></br><p>${message}</p>`, // html body
  };

  if (!captcha || !message || !sender || !subject || !name) {
    return res.status(422).json({
      message: "Unproccesable request, please provide the required fields",
    });
  }

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=6LdxipMhAAAAANurE7uFwEKLmOjNi-0tVt9pbae4&response=${captcha}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      method: "POST",
    },
  );

  
  const captchaValidation = await response.json();

  if (captchaValidation.success) {
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('error:',error)
        return res.status(422).json({
          message:
            "Error while sending your message, please refreach the page and try again",
        });
      }
      transporter.close();
      return res.status(200).json({
        message:
          "We appreciate you contacting us. We will look over your message and get back to you as soon as possible",
      });
    });  
  } else {
    return res.status(422).json({
      message: "Unproccesable request, Invalid captcha code",
    });
  }
};
