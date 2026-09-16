import {
  CalendarIcon,
  UsedIcon,
  ExpiredIcon,
  RevokedIcon,
} from "../../../../components/Icons";
import { formatDate } from "../../../../lib/formatDate";

const statConfig = {
  created: {
    label: "Created",
    field: "created_at",
    icon: CalendarIcon,
  },
  used: {
    label: "Used",
    field: "used_at",
    icon: UsedIcon,
  },
  expired: {
    label: "Expired",
    field: "expires_at",
    icon: ExpiredIcon,
  },
  revoked: {
    label: "Revoked",
    field: "revoked_at",
    icon: RevokedIcon,
  },
};

const InvitationCardStat = ({ invitation, type }) => {
  const config = statConfig[type];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const date = invitation[config.field];

  if (!date) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-0">
      <Icon className="justify-self-top" />

      <div className="flex flex-col">
        <span className="text-xs opacity-70">{config.label}</span>

        <span>{formatDate(date)}</span>
      </div>
    </div>
  );
};

export default InvitationCardStat;
