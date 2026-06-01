import { useState, useEffect } from "react";

// Local components

// MUI Components

// MUI Icons

function Equipment() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await azureClient.get(
          "/getAll?databaseId=procurement&containerId=equipment",
        );
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };
    fetchEquipment();
  }, []);

  return <></>;
}

export default Equipment;
