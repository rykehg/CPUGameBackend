const connection = require('../../database/connection');
const bcrypt = require('bcrypt');

module.exports = {
  async create(request, response) {
    const { login, email, type, password } = request.body;
    
    try {
      const userExists = await connection('users').where('nm_Email', email).first();

      if (userExists)
        return response.status(400).send({ error: 'User already exists.' });

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection('users').insert({
        nm_Login: login,
        nm_Email: email,
        nm_Type: type,
        nm_Password: hashedPassword
      });

      const user = await connection('users')
      .where('nm_Email', email)
      .first();

      user.nm_Password = undefined;

      return response.json({ user });

    } catch (error) {
      return response.status(400).json({ error: 'Registration failed.' });
    }
  },

  async delete(request, response) {
    const { email } = request.body;

    await connection('users')
          .where('nm_Email', email)
          .update({
            nm_Login: null,
            nm_Email: null,
            nm_Type: null,
            nm_Password: null
          });

    return response.status(204).send();
  }
};