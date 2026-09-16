import { Link } from "react-router";

const Users = () => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section className="flex flex-col flex-1 gap-4 p-4 overflow-hidden">
        <Link
          to="/admin/administration"
          className="link link-hover flex flex-row items-center gap-1 opacity-75"
          aria-label="Back to administration"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <h3 className="text-xs text-base-content">Administration</h3>
        </Link>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="flex flex-1 overflow-auto">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim. Donec pede justo, fringilla vel, aliquet
          nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a,
          venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
          Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
          vulputate eleifend tellus.
          <br />
          <br />
          Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.
          Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.
          Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.
          Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur
          ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas
          tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit
          amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel,
          luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante
          tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.
          Nullam quis ante.
          <br />
          <br />
          Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed
          fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed
          consequat, leo eget bibendum sodales, augue velit cursus nunc, quis
          gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum
          purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam
          accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit
          fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et
          ultrices posuere cubilia Curae; In ac dui quis mi consectetuer
          lacinia. Nam pretium turpis et arcu.
          <br />
          <br />
          Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis,
          ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a,
          consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus
          ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat
          pretium libero. Cras id dui. Aenean ut eros et nisl sagittis
          vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id,
          imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus.
          Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet
          imperdiet orci. Nunc nec neque.
          <br />
          <br />
          Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi.
          Curabitur ligula sapien, tincidunt non, euismod vitae, posuere
          imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed
          cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus
          accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci
          luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis
          porttitor congue, elit erat euismod orci, ac placerat dolor lectus
          quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus
          metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum
          fringilla pede sit amet augue. In turpis. Pellentesque posuere.
          Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue
          blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit
          libero, sodales nec, volutpat a, suscipit non, turpis. Nullam
          sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem
          libero volutpat nibh, nec pellentesque velit pede quis nunc.
          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
          posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero.
          Phasellus dolor. Maecenas vestibulum mollis
        </p>
      </section>
    </div>
  );
};

export default Users;
