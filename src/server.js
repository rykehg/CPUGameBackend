const app = require('./app')
const dotenv = require('dotenv')

dotenv.config()
app.listen(process.event.PORT || 3333);
