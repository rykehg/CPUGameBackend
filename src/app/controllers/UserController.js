const connection = require('../../database/connection');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailer = require('../../../modules/mailer.js');

module.exports = {
  async create(request, response) {
    const { login, email, type, name /*,password */ } = request.body;

    try {
      const userExists = await connection('users').where('nm_Email', email).first();

      if (userExists)
        
        return response.status(400).send({ error: 'User already exists.' });


      const token = crypto.randomBytes(20).toString('hex');

      // Tempo de expiração do token
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await connection('users').insert({
        nm_Login: login,
        nm_Name: name,
        nm_Email: email,
        nm_Type: type,
        nm_Password: token,
        dt_Expire: now
      });

      //const hashedPassword = await bcrypt.hash(password, 10);



      //update



      mailer.sendMail({
        to: email,
        from: 'emailto@no-reply.com.br', //usar mailtrap
        template: 'auth/forgot_password',
        context: { token },
      }, (err) => {
        if (err)
          return res.status(400).json({ error: 'Cannot send forgot password email.' });

        return res.send();

      });

      const user = await connection('users')
      .where('nm_Email', email)
      .first();

      user.nm_Password = undefined;
 
      return response.json({ user });

    } catch (error) {
      console.log(error);
      return response.status(400).json({ error: 'Registration failed' });
    }
  },

  async reset(request, response) {
    const { email, token } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {

      const user = await connection('users').where('nm_Email', email).first();



      if (user == null)
        return res.status(400).json('Cannot find user.');

      if (token !== user.nm_Password)
        return res.status(400).json({ error: 'Token invalid' });

      const now = new Date();

      if (now > user.dt_Expire)
        return res.status(400).json({ error: 'Token expired, generate a new one.' });

      if (hashedPassword == user.nm_Password)
        return res.status(400).json({ error: 'Same Password!! Sorry :/' });

      await connection('users').update({

        nm_Password: hashedPassword

      });



      res.send();
    } catch (err) {
      res.status(400).json({ error: 'Cannot reset password, try again.' });
    }

  },



  async delete(request, response) {
    const { email } = request.body;

    await connection('users')
      .where('nm_Email', email)
      .update({
        nm_Login: null,
        nm_Name: null,
        nm_Email: null,
        nm_Type: null,
        // nm_Password: null
      });

    return response.status(204).send();
  }
};