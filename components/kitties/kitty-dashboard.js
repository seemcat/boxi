import AddKittyForm from "./add-kitty-form";
import AllKittyPics from "./all-kitty-pics";
import { useState, useEffect } from "react";
import { useUser } from "../../lib/hooks";

const KittyDashboard = ({}) => {
  const [kittyPicUrlAdded, setKittyPicUrlAdded] = useState(false); // refresh kitty pics once a new kitty pic is added
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [kittyPics, setKittyPics] = useState([]);

  useEffect(() => {
    if (user && user.issuer) {
      if (kittyPicUrlAdded) return setKittyPicUrlAdded(false); // prevent double fetching of kitty pics
      getKittyPics();
    }
  }, [kittyPicUrlAdded, user]);

  const queryHasura = async (query) => {
    try {
      setIsLoading(true);
      let res = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + user?.token,
        },
        body: JSON.stringify(query),
      });
      setIsLoading(false);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const getKittyPics = async () => {
    const getKittyPicsQuery = {
      query: `{
        kitties(order_by: {id: desc}) {
          id
          pic_url
          user_id
          user {
            username
          }
        }
      }`,
    };
    try {
      let res = await queryHasura(getKittyPicsQuery);
      let { data, error } = await res.json();
      error ? console.log(error) : data.kitties && setKittyPics(data.kitties);
    } catch (error) {
      console.log(`Error fetching kitty pics: ${error}`);
    }
  };

  return (
    <div className="kitty-pics-container">
      <AddKittyForm
        setKittyPicUrlAdded={setKittyPicUrlAdded}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <AllKittyPics kittyPics={kittyPics} />
      <style jsx>{`
        .kitty-pics-container {
          width: 90%;
          max-width: 32rem;
          margin: 0 auto;
          box-shadow: 0px 0px 6px 6px #eee;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          margin-bottom: 40px;
        }
      `}</style>
    </div>
  );
};

export default KittyDashboard;
