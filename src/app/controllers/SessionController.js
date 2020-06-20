const connection = require('../../database/connection');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mailer = require('../../../modules/mailer.js');

function generateToken(params = {}){
  return jwt.sign(params, authConfig.secret, {
      expiresIn: 86400,
  });
}

module.exports = { 
  async authenticateSession (request, response){
    const { email, password } = request.body;

    try {
      const user = await connection('users')
        .select('*')
        .where('nm_Email', email)
        .first();
  
      if(!user)
        return response.status(400).json({ error: 'User not found.' });
  
      if(!await bcrypt.compare(password, user.nm_Password)) 
        return response.status(400).json({ error: 'Invalid password.' });
  
      user.nm_Password = undefined;
      user.dt_Expire = undefined;
      user.cd_Token = undefined;
  
      return response.json({ 
        user, 
        token: generateToken({ id: user.nm_Email }),
      });
    } catch (err) {
      return response.status(400).json({ error: 'Error during authentication. Try again!' });
    }
  }
  
};