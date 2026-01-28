import { sequelize } from "../db/config/database.js";
import initModels from "../db/models/init-models.js";
import { faker } from '@faker-js/faker';

var models = initModels(sequelize);


function createRandomUser() {
    return {
        usrCode: faker.string.uuid(),
        usrName: faker.person.lastName(),
        usrFirstname:faker.person.firstName(),
        usrMail: faker.internet.email(),
        usrImg: faker.image.avatar(),
        usrPassword: faker.internet.password(),
        usrCreatedDate: faker.date.past(),
        usrContact: faker.phone.number() ,
        usrGender: faker.person.gender(),
        usrIsDeleted:false,
        usrIsValided:true,
        usrCreatedDate:1,
        usrLogin:faker.internet.userName(),
        grpCode:"grp-1",

    };
  }

  const USERS = faker.helpers.multiple(createRandomUser, {
    count: 60,
  });

  const startIndex = 15;
  USERS.map((user,index)=> user.usrCode ="user-"+(index+startIndex) )
  //console.log(USERS);
const seedDatabase = async () => {
  try {
    // Sync all models that aren't already in the database
    await sequelize.sync();

    USERS.map((user) => {
      models.Users.create(user).then((user) =>
        console.log(user.usrName + " " + user.usrFirstname)
      );
    });

    console.log("Client data has been seeded!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seedDatabase();
