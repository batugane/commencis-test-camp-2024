import axios from 'axios'
import { expect } from 'chai'

const baseUrl = 'https://thinking-tester-contact-list.herokuapp.com'
let userId
let token

describe('API Automation HW', () => {
  // Add User
  it('should add a new user', async () => {
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Math.random().toString(36).substring(7)}@fake.com`,
      password: 'myPassword',
    }

    const response = await axios.post(`${baseUrl}/users`, newUser)
    expect(response.status).to.equal(201)
    expect(response.data).to.have.property('user')
    expect(response.data.user).to.have.property('_id')
    userId = response.data.user._id
    token = response.data.token
  })

  // Get User Profile
  it('should get the newly added user profile', async () => {
    const response = await axios.get(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).to.equal(200)
    expect(response.data).to.have.property('_id', userId)
  })

  // Update User
  it("should update the user's first and last name", async () => {
    const updatedUser = {
      firstName: `Updated${Math.random().toString(36).substring(7)}`,
      lastName: `User${Math.random().toString(36).substring(7)}`,
    }

    const response = await axios.patch(`${baseUrl}/users/me`, updatedUser, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).to.equal(200)
    expect(response.data.firstName).to.equal(updatedUser.firstName)
    expect(response.data.lastName).to.equal(updatedUser.lastName)
  })

  // Get Updated User
  it('should get the updated user profile', async () => {
    const response = await axios.get(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).to.equal(200)
    expect(response.data.firstName).to.contain('Updated')
  })

  // Delete User
  it('should delete the user', async () => {
    const response = await axios.delete(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).to.equal(200)
  })

  // Verify User is Deleted
  it('should verify the user is deleted', async () => {
    try {
      await axios.get(`${baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      expect(error.response.status).to.equal(401)
    }
  })
})
