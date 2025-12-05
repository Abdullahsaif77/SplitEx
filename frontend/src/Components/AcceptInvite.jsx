import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.post(
          `https://split-ex-backend.vercel.app/group/invite/accept/${token}`
        );

        if (res.data.action === "redirect_to_signup") {
          navigate(`/register?groupId=${res.data.groupId}&token=${res.data.token}&email=${res.data.email}`);
        }
         else {
          navigate("/profile");
        }
      } catch (err) {
        console.error("Error accepting invite:", err);
      }
    };

    acceptInvite();
  }, [token, navigate]);

  return <p>Processing your invite...</p>;
};

export default AcceptInvite;
