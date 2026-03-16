import SteamCard from "src/components/accounts/steam-connect-card"
import DiscordCard from "src/components/accounts/discord-connect-card"

const accountCardComponents = {
  ComponentIntegrationsSteam: SteamCard,
  ComponentIntegrationsDiscord: DiscordCard,
}
const Account = ({ data, activationDate }) => {
  if (data.show !== true) return null
  const AccountCard = accountCardComponents[data.__typename]
  if (!AccountCard) {
    return null
  }
  return <AccountCard data={data} activationDate={activationDate} />
}
const Accounts = ({ data }) => {
  const { accounts, activationDate } = data
  return (
    <ul className="grid justify-center gap-4 sm:grid-cols-fit-accounts">
      {accounts.map((accountData) => (
        <li key={`${accountData.__typename}${accountData.id}`}>
          <Account data={accountData} activationDate={activationDate} />
        </li>
      ))}
    </ul>
  )
}

export default Accounts
