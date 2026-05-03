
import { compare } from 'bcryptjs';

const key = 'vk_live_01f252f55a17f24e9a384099ac411ea7de16792b';
const hash = '$2b$12$5l5bsPOz7wr7yiK.z4Q3pe9QZUByNo10tHgzQnoDzBQJboxUUkjeC';

compare(key, hash).then(console.log);
