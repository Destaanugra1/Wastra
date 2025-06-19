import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/Dropdwon';
import { Link } from 'react-router-dom';
import { generateRandomCode } from '../service/RandomUrl';
import { Settings2 } from 'lucide-react';
const url = `/${generateRandomCode()}`;

const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.role === 'admin';

export const Modaldrop = () => {
  return (
    <div className='cursor-pointer'>
      <DropdownMenu>
        <div className='cursor-point'>
          <DropdownMenuTrigger>
            <Settings2 />
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>

          <DropdownMenuSeparator />
          {isAdmin && (
            <Link to={url}>
              <DropdownMenuItem>DashBoard</DropdownMenuItem>
            </Link>
          )}

          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
