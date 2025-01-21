import { Sequelize, DataTypes, Model } from "sequelize";

// Configure Sequelize to connect to MySQL
const sequelize = new Sequelize(
  "defaultdb",
  "avnadmin",
  "AVNS_nxv-10Ssw36Rw_bp0LN",
  {
    host: "market-place-bot-yamifikru4-4606.i.aivencloud.com",
    port: 15107,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// Define the User model
class User extends Model {
  public id!: number;
  public chatId!: string;
  public username!: string;
  public score!: number;
}

User.init(
  {
    chatId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

export { sequelize, User };
