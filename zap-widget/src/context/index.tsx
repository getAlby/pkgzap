import React, { useContext, useState } from 'react'

type UserContextType = {
  invoice: string
  setInvoice: React.Dispatch<React.SetStateAction<string>>
  paid: boolean
  setPaid: React.Dispatch<React.SetStateAction<boolean>>

}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = React.createContext<UserContextType | undefined>(undefined)

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoice, setInvoice] = useState("")
  const [paid, setPaid] = useState(false)

  return (
    <UserContext.Provider
      value={{
        invoice,
        setInvoice,
        paid,
        setPaid
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useClient = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a UserContextProvider')
  }
  return context
}
