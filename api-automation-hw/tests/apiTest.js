import axios from 'axios'
import { expect } from 'chai'

const baseUrl = 'https://thinking-tester-contact-list.herokuapp.com'
let userId
let token

// Helper function to get authentication headers
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Helper function for error handling
const handleRequestError = (action, error) => {
  throw new Error(`Failed to ${action}: ${error.message}`)
}

describe('Commencis TestCamp 2024 | API Automation HW', () => {
  // Add User
  it('should add a new user', async () => {
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Math.random().toString(36).substring(7)}@fake.com`,
      password: 'myPassword',
    }
    try {
      const response = await axios.post(`${baseUrl}/users`, newUser)
      expect(response.status).to.equal(201)
      expect(response.data).to.have.property('user')
      userId = response.data.user._id
      token = response.data.token
    } catch (error) {
      handleRequestError('create user', error)
    }
  })

  // Get User Profile
  it('should get the newly added user profile', async () => {
    try {
      const response = await axios.get(`${baseUrl}/users/me`, getAuthHeaders())
      expect(response.status).to.equal(200)
      expect(response.data).to.have.property('_id', userId)
    } catch (error) {
      handleRequestError('get user profile', error)
    }
  })

  // Update User
  it("should update the user's first and last name", async () => {
    const updatedUser = {
      firstName: `Updated${Math.random().toString(36).substring(7)}`,
      lastName: `User${Math.random().toString(36).substring(7)}`,
    }

    try {
      const response = await axios.patch(`${baseUrl}/users/me`, updatedUser, getAuthHeaders())
      expect(response.status).to.equal(200)
      expect(response.data.firstName).to.equal(updatedUser.firstName)
      expect(response.data.lastName).to.equal(updatedUser.lastName)
    } catch (error) {
      handleRequestError('update user', error)
    }
  })

  // Get Updated User
  it('should get the updated user profile', async () => {
    try {
      const response = await axios.get(`${baseUrl}/users/me`, getAuthHeaders())
      expect(response.status).to.equal(200)
      expect(response.data.firstName).to.contain('Updated')
    } catch (error) {
      handleRequestError('get updated user profile', error)
    }
  })

  // Delete User
  it('should delete the user', async () => {
    try {
      const response = await axios.delete(`${baseUrl}/users/me`, getAuthHeaders())
      expect(response.status).to.equal(200)
    } catch (error) {
      handleRequestError('delete user', error)
    }
  })

  // Verify User is Deleted
  it('should verify the user is deleted', async () => {
    try {
      await axios.get(`${baseUrl}/users/me`, getAuthHeaders())
    } catch (error) {
      expect(error.response.status).to.equal(401)
    }
  })
})
