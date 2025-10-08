import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { Clock, User, Users } from "lucide-react";

const ActivityFeed = ({ activities }) => {
  return (
    <div className="card shadow-lg border-0 rounded-4 p-4 mt-4">
      <h5 className="fw-bold mb-3">Recent Activity</h5>

      {activities.length === 0 ? (
        <p className="text-muted text-center">No recent activities yet.</p>
      ) : (
        <ul className="list-group list-group-flush">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.li
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="list-group-item d-flex justify-content-between align-items-center border-0 px-0"
              >
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    {activity.group ? (
                      <Users size={20} className="text-primary" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="mb-1">
                      <strong>{activity.user?.name || "Someone"}</strong>{" "}
                      {activity.action || "performed an action"}{" "}
                      {activity.group && (
                        <>
                          in <span className="fw-bold">{activity.group.name}</span>
                        </>
                      )}
                    </p>
                    <small className="text-muted d-flex align-items-center">
                      <Clock size={14} className="me-1" />
                      {new Date(activity.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
