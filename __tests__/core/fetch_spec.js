import { fetchOptions } from 'core/fetch'

describe('fetch', () => {
  
  describe('fetchOptions()', () => {

    describe('POST', () => {

      it('should pass the parameters as part of the body on a POST', () => {
        const params = { name: 'aName', age: 23 }
        expect(fetchOptions('POST', params)).toEqual({
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
      })

      it('should create a form-data if we have a file (upload)', () => {
        const params = {
          name: 'aName',
          age: 23,
          file: { name: 'myFile', file: 'hello world!!' }
        }
        const doWith = (obj, fn) => { fn(obj); return obj }

        expect(fetchOptions('POST', params)).toEqual({
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: doWith(new FormData(), data => {
            data.append('name', 'aName')
            data.append('age', 23)
            data.append('myFile', 'hello world!!')
          })
        })
      })
      
    })
    
  })

})