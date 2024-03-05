import { DataSource } from 'typeorm'
import { StateEntity } from '../entities/xstate/StateEntity'

import { DataStoreXStateStoreEntities, DataStoreXStateStoreMigrations, SaveStateArgs, XStateStore } from '../index'

describe('Database entities tests', (): void => {
  let dbConnection: DataSource

  beforeEach(async (): Promise<void> => {
    dbConnection = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      //logging: 'all',
      migrationsRun: false,
      migrations: DataStoreXStateStoreMigrations,
      synchronize: false,
      entities: [...DataStoreXStateStoreEntities],
    }).initialize()
    await dbConnection.runMigrations()
    expect(await dbConnection.showMigrations()).toBeFalsy()
  })

  afterEach(async (): Promise<void> => {
    await dbConnection.destroy()
  })

  it('should save xstate event to database', async (): Promise<void> => {
    const expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + 100000)
    const xstateEvent: SaveStateArgs = {
      stateName: 'acceptAgreement',
      machineType: 'Onboarding',
      xStateEventType: 'SET_TOC',
      state: { myState: 'test_state' },
      tenantId: 'test_tenant_id',
      expiresAt,
    }
    const fromDb: StateEntity = await dbConnection.getRepository(StateEntity).save(XStateStore.stateEntityFrom(xstateEvent))

    expect(fromDb).toBeDefined()
    expect(fromDb?.id).not.toBeNull()
    expect(fromDb?.machineType).toEqual(xstateEvent.machineType)
    expect(JSON.parse(fromDb?.state)).toEqual(xstateEvent.state)
    expect(fromDb?.tenantId).toEqual(xstateEvent.tenantId)
    expect(fromDb?.completedAt).toBeNull()
  })
})