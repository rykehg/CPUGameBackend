const connection = require('../../database/connection');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailer = require('../../../modules/mailer.js');

module.exports = { 

  async create (request, response) {
    const { login, email, type, name } = request.body;

    try {
      const userExists = await connection('users').where('nm_Email', email).first();

      if (userExists)
        
        return response.status(400).json({ error: 'User already exists.' });


      const token = crypto.randomBytes(20).toString('hex');
      const hashedToken = await bcrypt.hash(token, 10)
      // Tempo de expiração do token
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await connection('users').insert({
        nm_Login: login,
        nm_Name: name,
        nm_Email: email,
        nm_Type: type,
        cd_Token: hashedToken,
        dt_Expire: now
      });

      //update

      mailer.sendMail({
        to: email,
        from: 'emailto@no-reply.com.br', //usar mailtrap
        template: 'auth/first_acess',
        context: { token },
      }, (err) => {
        if (err)
          return response.status(400).json({ error: 'Cannot send forgot password email.' });

        return response.send();

      });

      const user = await connection('users')
      .where('nm_Email', email)
      .first();

      user.nm_Password = undefined;
 
      return response.status(201).json({ user, token: token});

    } catch (error) {
      console.log(error);
      return response.status(400).json({ error: 'Registration failed' });
    }
  },

  async firstAccess (request, response) {
    const { email, token, password } = request.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await connection('users').where('nm_Email', email).first();

      if (user == null)
        return response.status(400).json('Cannot find user.');

      if (!await bcrypt.compare(token, user.cd_Token))
        return response.status(400).json({ error: 'Token invalid' });

      const now = new Date();

      if (now > user.dt_Expire){
        await connection('users')
        .where('nm_Email', email)
        .update({
          nm_Login: null,
          nm_Name: null,
          nm_Email: null,
          nm_Type: null,
          cd_Token: null
        });
        return response.status(400).json({ error: 'Token expired, register again.' });
      }
      await connection('users').update({
        nm_Password: hashedPassword
      });

      response.send();
    } catch (err) {
      response.status(400).json({ error: 'Cannot reset password, try again.' });
    }
  },

  async forgotPassword(request, response) {
    const { email } = request.body;

    try {
      const user = await connection('users')
        .where('nm_Email', email)
        .first();
  
      if(!user)
        return response.status(400).json({ error: 'User not found!' });
  
      const token = crypto.randomBytes(20).toString('hex');
  
      const hashedToken = await bcrypt.hash(token, 10);
  
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
  
      await connection('users')
        .update({
          cd_Token: hashedToken,
          dt_Expire: now,
        })
        .where('nm_Email', email);
  
      mailer.sendMail({
        to: email,
        from: 'email@no-reply.com.br',
        template: 'auth/forgot_password',
        context: { token },
      }, (err) => {
        if(err)
          return response.status(400).json({ error: 'Cannot send forgot password email.' });
      
        return response.send();  
      });
      return response.send();
    } catch (err) {
      return response.status(400).json({ error: 'Error on forgot password. Please, try again!' });
    }
  },

  async resetPassword (request, response) {
    const { email, token, password } = request.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await connection('users').where('nm_Email', email).first();

      if (user == null)
        return response.status(400).json('Cannot find user.');

      if (!await bcrypt.compare(token, user.cd_Token))
        return response.status(400).json({ error: 'Token invalid.' });

      const now = new Date();

      if (now > user.dt_Expire)
        return response.status(400).json({ error: 'Token expired, generate a new one.' });

      if (await bcrypt.compare(password, user.nm_Password))
        return response.status(400).json({ error: 'Same Password!!' });

      await connection('users').update({
        nm_Password: hashedPassword
      });
      response.send();

    } catch (err) {
      response.status(400).json({ err });//error: 'Cannot reset password, try again.' });
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
        cd_Token: null
      });

    return response.status(204).send();
  }
};