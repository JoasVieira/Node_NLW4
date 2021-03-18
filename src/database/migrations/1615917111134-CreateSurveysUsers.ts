import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateSurveysUsers1615917111134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'surveys_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'users_id',
            type: 'uuid'
          },
          {
            name: 'surveys_id',
            type: 'uuid'
          },
          {
            name: 'value',
            type: 'number',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'FKUsers',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['users_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          {
            name: 'FKSurveys',
            referencedTableName: 'surveys',
            referencedColumnNames: ['id'],
            columnNames: ['surveys_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('surveys_users')
  }
}
