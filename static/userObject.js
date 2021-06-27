

export default function userobjectinfo(userinfo)
{
    const name = userinfo.displayName
    const email = userinfo.email
    const photourl = userinfo.photoURL
    const udi = userinfo.uid

    return { name,email,photourl,udi }
}