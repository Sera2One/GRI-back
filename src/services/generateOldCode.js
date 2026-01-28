import { Op } from 'sequelize';
import { sequelize } from '../db/config/database.js';
import initModels from '../db/models/init-models.js';
const models = initModels(sequelize);

export async function generateOldCode(Name, model) {
	const primaryKeyName = await model.primaryKeyAttribute;
	const lastData = await model.findAll({
		where: {
			[primaryKeyName]: {
				[Op.like]: `%${Name}_old%`,
			},
		},
		attributes: [primaryKeyName],
		raw: true,
	});


	if (lastData.length === 0) {
		return Name + '_old.1';
	} else {
            const lastCode = lastData
                  .map(data => {
                        return parseInt(data[primaryKeyName].split('_old.')[1]);
                  })
                  .reduce((previousId, currentId) =>
                        previousId > currentId ? previousId : currentId,
                  );

		return Name + '_old.' + (lastCode + 1);
	}
}

//console.log(await generateOldCode('user-10', models.Users));
