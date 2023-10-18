import { DataTypes, Model, Sequelize } from "sequelize";

type UserType = {
  id: number;
  name: string;
  score: number;
};

class User extends Model<Pick<UserType, "name" | "score">> {
  public name!: string;
  public score!: number;
  private password!: string;

  // Auto-generated
  public id!: number;

  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        name: DataTypes.STRING,
        score: DataTypes.INTEGER,
      },
      { modelName: "Users", sequelize: sequelize }
    );
  }
}

export default User;
