import * as React from "react";
import {
  Component,
  ComponentLogs,
  BaseProps
} from "../runtime";
import {
  CreateContextFeed
} from "../runtime/ContextFeed";
import {
  Arc as Protocol,
  ArcConfig as ProtocolConfig
} from "../protocol";
import {
  DAO,
  DAOEntity
} from "./";
import {
  Member as Entity,
  IMemberState as Data
} from "@daostack/client";

// TODO: remove me, just use entity
type Code = { }

interface RequiredProps extends BaseProps {
  // Address of the member
  address: string;
  // Address of the DAO Avatar
  dao?: string;
}

interface InferredProps extends RequiredProps {
  config: ProtocolConfig | undefined;
}

class InferredMember extends Component<InferredProps, Entity, Data, Code>
{
  protected createEntity(): Entity {
    const { address, dao, config } = this.props;

    if (!dao) {
      throw Error("DAO Address Missing: Please provide this field as a prop, or use the inference component.");
    }
    if (!config) {
      throw Error("Arc Config Missing: Please provide this field as a prop, or use the inference component.");
    }

    return new Entity({ address, dao }, config.connection);
  }

  protected async initialize(entity: Entity | undefined): Promise<void> {
    if (entity) {
      await entity.fetchStaticState();
    }

    return Promise.resolve();
  }

  public static get Entity() {
    return CreateContextFeed(this._EntityContext.Consumer, this._LogsContext.Consumer);
  }

  public static get Data() {
    return CreateContextFeed(this._DataContext.Consumer, this._LogsContext.Consumer);
  }

  public static get Code() {
    return CreateContextFeed(this._CodeContext.Consumer, this._LogsContext.Consumer);
  }

  public static get Logs() {
    return CreateContextFeed(this._LogsContext.Consumer, this._LogsContext.Consumer);
  }

  protected static _EntityContext = React.createContext({ });
  protected static _DataContext   = React.createContext({ });
  protected static _CodeContext   = React.createContext({ });
  protected static _LogsContext   = React.createContext({ });
}

class Member extends React.Component<RequiredProps>
{
  public render() {
    const { address, dao, children } = this.props;

    return (
      <Protocol.Config>
      {(config: ProtocolConfig) => {
        if (dao) {
          return (
            <InferredMember address={address} dao={dao} config={config}>
            {children}
            </InferredMember>
          )
        } else {
          return (
            <DAO.Entity>
            {(entity: DAOEntity) => (
              <InferredMember address={address} dao={entity.id} config={config}>
              {children}
              </InferredMember>
            )}
            </DAO.Entity>
          );
        }
      }}
      </Protocol.Config>
    );
  }

  public static get Entity() {
    return InferredMember.Entity;
  }

  public static get Data() {
    return InferredMember.Data;
  }

  public static get Code() {
    return InferredMember.Code;
  }

  public static get Logs() {
    return InferredMember.Logs;
  }
}

export default Member;

export {
  Member,
  InferredMember,
  Entity as MemberEntity,
  Data   as MemberData,
  Code   as MemberCode,
  ComponentLogs
};
