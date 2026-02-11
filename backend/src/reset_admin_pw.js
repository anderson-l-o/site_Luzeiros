import { User } from './sequelize.js';
import { hashPassword } from './services/authService.js';

(async function(){
  try{
    const hash = hashPassword('123456');
    const [count] = await User.update({ passwordHash: hash }, { where: { email: 'admin@aventureiros.com' } });
    console.log('Updated rows:', count);
    process.exit(0);
  }catch(e){
    console.error('Error updating admin pw', e);
    process.exit(2);
  }
})();
