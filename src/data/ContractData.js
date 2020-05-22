const Contract = require('../models/contract')

const getContractByDate = async (date) => {
  return await Contract.find({ 'datetime': date })
}

const getContractByContractId = async (contractId) => {
  try {
    const contract = await Contract.findById(contractId)
    return ({ status: 200, data: contract })
  } catch (e) {
    return ({ status: 400, data: e })
  }
}

const getContractsByPlayerId = async (playerId) => {
  return await Contract.find({ 'player_id': playerId })
}

const getContractsByOpponentId = async (opponentId) => {
  return await Contract.find({ 'opponent_id': opponentId })
}

const getContractsByPlayerOrOpponentId = async (Id) => {
  return await Contract.find({ $or: [{ playerId: Id }, { opponentId: Id }] })
}

const deleteContractsByPlayerOrOpponentId = async (Id) => {
  try {
    await Contract.deleteMany({ $or: [{ playerId: Id }, { opponentId: Id }] })
    return ({ status: 200, data: 'All Contracts deleted successfully' })
  } catch (e) {
    return ({ status: 400, data: e })
  }
}

//when a player deletes his profile all unresolved contracts will be deleted as well 
const deleteUnresolvedContracts = async (Id) => {
  try {
    // deletes objects with a status 1 or 2 and playerId or opponentId
    await Contract.deleteMany({$and:[{ status: { $in: [ 1, 2 ] } }, { $or: [{ playerId: Id }, { opponentId: Id }] }]})
    return ({ status: 200, data: 'All pending contracts deleted successfully' })
  } catch (e) {
    return ({ status: 400, data: e })
  }
}

const registerContract = async (contract, playerId) => {
  const requiredFields = ['rules', 'datetime', 'school', 'referee']
  try {
    let newContract = new Contract({
      rules: contract.rules,
      datetime: (Date.parse(contract.datetime)) / 1000,
      weightClass: contract.weightClass,
      school: contract.school,
      playerComments: contract.playerComments,
      playerId,
      playerFirstName: contract.playerFirstName,
      playerLastName: contract.playerLastName,
      opponentFirstName: contract.opponentFirstName,
      opponentLastName: contract.opponentLastName,
      opponentId: contract.opponentId,
      refereeFirstName: contract.refereeFirstName,
      refereeLastName: contract.refereeLastName
    })
    let result = await newContract.save()
    return ({ status: 200, data: result })
  } catch (e) {
    let errArray = requiredFields.map((field) => {
      if (e.errors[field] != undefined) {
        return e.errors[field].path
      }
    }).filter((path) => {
      return path != undefined
    })
    return ({ status: 400, data: 'Missing fields: ' + errArray })
  }
}

const updateContract = async (contractId, updates) => {
  try {
    const updated = await Contract.findOneAndUpdate({ _id: contractId }, updates, { new: true })
    return ({ status: 200, data: updated })
  } catch (e) {
    return ({ status: 400, data: e })
  }
}

module.exports = {
  getContractByDate,
  registerContract,
  getContractsByOpponentId,
  getContractsByPlayerId,
  getContractsByPlayerOrOpponentId,
  deleteContractsByPlayerOrOpponentId,
  getContractByContractId,
  updateContract,
  deleteUnresolvedContracts
}