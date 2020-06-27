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
        return response.status(400).json({ error: 'E-mail já cadastrado.' });

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
          return response.status(400).json({ error: 'Não foi possivel mandar e-mail de confirmação.' });

        return response.send();

      });

      const user = await connection('users')
      .where('nm_Email', email)
      .first();

      user.nm_Password = undefined;
 
      return response.status(201).json({ user, token: token});

    } catch (error) {
      console.log(error);
      return response.status(400).json({ error: 'O resgistro falhou.' });
    }
  },

  async firstAccess (request, response) {
    const { email, token, password } = request.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await connection('users').where('nm_Email', email).first();

      if (user == null)
        return response.status(400).json('Não foi possivel encontrar o usuário.');

      if(!(/^(?=.*[a-zA-Z])(?=.*[0-9])/).test(password))
        return response.status(400).json({ error: 'A senha deve conter números e letras' });

      if (!await bcrypt.compare(token, user.cd_Token))
        return response.status(400).json({ error: 'Token inválido.' });


      const now = new Date();
      //If token has expired in firts access user data will be erased
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
        return response.status(400).json({ error: 'Token expirou, por favor faça o cadastro novamente.' });
      }
      await connection('users').update({
        nm_Password: hashedPassword
      });

      response.send();
    } catch (err) {
      response.status(400).json({ error: 'Não foi possivel cadastrar a senha. Por favor tente novamente.' });
    }
  },

  async forgotPassword(request, response) {
    const { email } = request.body;

    try {
      const user = await connection('users')
        .where('nm_Email', email)
        .first();
  
      if(!user)
        return response.status(400).json({ error: 'Usuário não encontrado.' });
  
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
          return response.status(400).json({ error: 'Não foi possivel mandar o e-mail de recuperação de senha. Tente novamente.' });
      
        return response.send();  
      });
      return response.send();
    } catch (err) {
      return response.status(400).json({ error: 'Erro eu tentar recuperar a senha. Tente novamente.' });
    }
  },

  async resetPassword (request, response) {
    const { email, token, password } = request.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await connection('users').where('nm_Email', email).first();

      if (user == null)
        return response.status(400).json('Usuário não encontrado.');
        
      if(!(/^(?=.*[a-zA-Z])(?=.*[0-9])/).test(password))
        return response.status(400).json({ error: 'A senha deve conter números e letras' });

      if (!await bcrypt.compare(token, user.cd_Token))
        return response.status(400).json({ error: 'Token inválido.' });

      const now = new Date();

      if (now > user.dt_Expire)
        return response.status(400).json({ error: 'Token expirou, por favor tente novamente.' });

      if (await bcrypt.compare(password, user.nm_Password))
        return response.status(400).json({ error: 'Senha já cadastrada.' });

      await connection('users').update({
        nm_Password: hashedPassword
      });
      response.send();

    } catch (err) {
      response.status(400).json({ error: 'Não foi possivel cadastrar a senha. Tente novamente.' });
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